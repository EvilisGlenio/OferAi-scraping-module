import axios from "axios";
import { ScrapedItemData } from "./scraper";

const BACKEND_API_URL = "http://localhost:3000";

async function sendDataToBackend(item: ScrapedItemData): Promise<void> {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/items`, item);
    console.log(
      `Item "${item.title}" enviado com sucesso para o backend. Status: ${response.status}`
    );
  } catch (error: any) {
    console.error(
      `Erro ao enviar item "${item.title}" para o backend:`,
      error.message
    );
    if (error.response) {
      console.error("Detalhes do erro do backend:", error.response.data);
    }
  }
}

export { sendDataToBackend };
