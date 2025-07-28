"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
function safeGetTextContent(page_1, selector_1) {
    return __awaiter(this, arguments, void 0, function* (page, selector, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                yield page.waitForSelector(selector, { timeout: 5000 }); // Espera até 5 seguindos
                const element = yield page.locator(selector).first();
                const text = yield element.textContent();
                return (text === null || text === void 0 ? void 0 : text.trim()) || null; // Retorna null se o texto for vazio ou null
            }
            catch (error) {
                console.warn(`Tentativa ${i + 1} falhou para o seletor "${selector}": ${error}`);
                if (i === retries - 1) {
                    return null;
                }
                yield page.waitForTimeout(delay); // Espera amtes de tentar novamente
            }
        }
        return null; // Retorna null se falhar após todas as tentativas
    });
}
function safeGetAttribute(page_1, selector_1, attribute_1) {
    return __awaiter(this, arguments, void 0, function* (page, selector, attribute, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                yield page.waitForSelector(selector, { timeout: 5000 });
                const element = yield page.locator(selector).first();
                const value = yield element.getAttribute(attribute);
                return (value === null || value === void 0 ? void 0 : value.trim()) || null;
            }
            catch (error) {
                console.warn(`Tentativa ${i + 1} falhou para o seletor "${selector}" e atributo "${attribute}": ${error}`);
                if (i < retries - 1) {
                    yield page.waitForTimeout(delay);
                }
            }
        }
        return null;
    });
}
function scrapeProducts(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser;
        try {
            browser = yield playwright_1.chromium.launch({ headless: false }); // Use headless: false para depuração visual
            const page = yield browser.newPage();
            yield page.goto(url, { waitUntil: "domcontentloaded" });
            // Aguarda o seletor do título estar visível para garantir que a página carregou
            yield page.waitForSelector("span#productTitle");
            // Extração dos dados
            const title = yield safeGetTextContent(page, "span#productTitle");
            const textPrice = yield safeGetTextContent(page, "div#corePriceDisplay_desktop_feature_div div.a-section span.a-price span span.a-price-whole");
            const price = textPrice
                ? parseFloat(textPrice.replace(/R\$\s*/g, "").replace(",", "."))
                : 0;
            const imageUrl = yield safeGetAttribute(page, "#landingImage", "src");
            const productUrl = page.url();
            // // Extração da descrição do elemento <div id="feature-bullets">
            const descriptionItems = yield page
                .locator("div#feature-bullets ul.a-unordered-list li span.a-list-item")
                .allTextContents();
            const description = descriptionItems.map((item) => item.trim()).join(" ");
            const category = (yield safeGetTextContent(page, "div#wayfinding-breadcrumbs_feature_div ul.a-unordered-list li span.a-list-item a.a-link-normal", 3, 1000)) || "Processadores"; // Extrai a última categoria do breadcrumb
            if (title && price && imageUrl && productUrl) {
                const scrapedItem = {
                    title: title.trim(),
                    description: (description === null || description === void 0 ? void 0 : description.trim()) || undefined,
                    price,
                    imageUrl,
                    productUrl,
                    category: (category === null || category === void 0 ? void 0 : category.trim()) || "Processadores",
                };
                return scrapedItem;
            }
            else {
                console.error("Alguns dados obrigatórios não foram encontrados.");
                return null;
            }
        }
        catch (error) {
            console.error("Erro durante a raspagem:", error);
            return null;
        }
        finally {
            if (browser) {
                yield browser.close();
            }
        }
    });
}
exports.default = scrapeProducts;
// Exemplo de uso
(() => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://www.amazon.com.br/AMD-Ryzen-4500-desbloqueado-refrigerador/dp/B09VCJN7HZ/ref=sr_1_6?adgrpid=150639197669&dib=eyJ2IjoiMSJ9.LSEzuqYT3vRtsFhcoKhYE5roqEV_iKhb-GSKvkkcYzbh34kk4evjSyuDffAKMPmc-700TRcCjnlYSiUBJc8QjCYYQhaiUg4GU4uPPSRE-ZOy89JZvdyYYzp-7KPlHlcxcDbQn3VJtnVP86nzMXxc095Q01tlxagZNcaJKDmrW7yrE3AnZJFL81qlhL8qoQqqhjQ9aIJjUfzisaikhMllghizHEWF_-7MEoujAQ3LCY_rB4vHb0ZOvLyjsI1FaNgAz7XcGq0k_HyGwCFsgt5BuqJLy6JVD-XzpvDaublliRs.5kaadiTryZqFFNO_hMXZanwNRPkrxZW1Ltu3F1NNeQQ&dib_tag=se&gad_source=1&hvadid=665042181322&hvdev=c&hvlocphy=9101480&hvnetw=g&hvqmt=e&hvrand=8735050881343553512&hvtargid=kwd-1908276647722&hydadcr=14647_13425954&keywords=amazon+ryzen+5+5500&mcid=6ab46489b8a2319283d39d8a026053ae&qid=1753619236&sr=8-6&ufe=app_do%3Aamzn1.fos.4bddec23-2dcf-4403-8597-e1a02442043d";
    const item = yield scrapeProducts(url);
    console.log("Item raspado:", item);
}))();
