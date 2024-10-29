import axios, {
  AxiosResponse,
  AxiosRequestConfig,
  RawAxiosRequestHeaders,
} from "axios";

class HTTPProductService {
  url: string;

  constructor() {
    this.url = "https://02557f4d-8f03-405d-a4e7-7a6483d26a04.mock.pstmn.io";
  }

  async get(endpoint: string) {
    try {
      const response: AxiosResponse = await axios.get(`${this.url}/${endpoint}`);

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
      };
    }
  }
}

export default HTTPProductService;
