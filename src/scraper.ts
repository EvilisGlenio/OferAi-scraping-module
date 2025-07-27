import { Browser, chromium } from "playwright";

interface ScrapedItemData {
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  category?: string;
}

async function scrapeProducts(url: string): Promise<ScrapedItemData | null> {
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: false }); // Use headless: false para depuração visual
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Aguarda o seletor do título estar visível para garantir que a página carregou
    await page.waitForSelector("span#productTitle");

    // Extração dos dados
    const title = await page.locator("span#productTitle").textContent();
    const textPrice = await page
      .locator(
        "div#corePriceDisplay_desktop_feature_div div.a-section span.a-price span span.a-price-whole"
      )
      .textContent();
    const price = textPrice
      ? parseFloat(textPrice.replace(/R\$\s*/g, "").replace(",", "."))
      : 0;
    const imageUrl = await page.locator("#landingImage").getAttribute("src");
    const productUrl = page.url();

    // // Extração da descrição do elemento <div id="feature-bullets">
    const descriptionItems = await page
      .locator("div#feature-bullets ul.a-unordered-list li span.a-list-item")
      .allTextContents();
    const description = descriptionItems.map((item) => item.trim()).join(" ");

    const category = await page
      .locator(
        "div#wayfinding-breadcrumbs_feature_div ul.a-unordered-list li span.a-list-item a.a-link-normal"
      )
      .last()
      .textContent(); // Extrai a última categoria do breadcrumb

    if (title && price && imageUrl && productUrl) {
      const scrapedItem: ScrapedItemData = {
        title: title.trim(),
        description: description?.trim() || undefined,
        price,
        imageUrl,
        productUrl,
        category: category?.trim() || "Processadores",
      };
      return scrapedItem;
    } else {
      console.error("Alguns dados obrigatórios não foram encontrados.");
      return null;
    }
  } catch (error) {
    console.error("Erro durante a raspagem:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default scrapeProducts;

// Exemplo de uso
(async () => {
  const url =
    "https://www.amazon.com.br/AMD-Ryzen-4500-desbloqueado-refrigerador/dp/B09VCJN7HZ/ref=sr_1_6?adgrpid=150639197669&dib=eyJ2IjoiMSJ9.LSEzuqYT3vRtsFhcoKhYE5roqEV_iKhb-GSKvkkcYzbh34kk4evjSyuDffAKMPmc-700TRcCjnlYSiUBJc8QjCYYQhaiUg4GU4uPPSRE-ZOy89JZvdyYYzp-7KPlHlcxcDbQn3VJtnVP86nzMXxc095Q01tlxagZNcaJKDmrW7yrE3AnZJFL81qlhL8qoQqqhjQ9aIJjUfzisaikhMllghizHEWF_-7MEoujAQ3LCY_rB4vHb0ZOvLyjsI1FaNgAz7XcGq0k_HyGwCFsgt5BuqJLy6JVD-XzpvDaublliRs.5kaadiTryZqFFNO_hMXZanwNRPkrxZW1Ltu3F1NNeQQ&dib_tag=se&gad_source=1&hvadid=665042181322&hvdev=c&hvlocphy=9101480&hvnetw=g&hvqmt=e&hvrand=8735050881343553512&hvtargid=kwd-1908276647722&hydadcr=14647_13425954&keywords=amazon+ryzen+5+5500&mcid=6ab46489b8a2319283d39d8a026053ae&qid=1753619236&sr=8-6&ufe=app_do%3Aamzn1.fos.4bddec23-2dcf-4403-8597-e1a02442043d";
  const item = await scrapeProducts(url);
  console.log("Item raspado:", item);
})();
