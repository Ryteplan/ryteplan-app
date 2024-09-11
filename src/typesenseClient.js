import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: "6cm8vjdnx1uthfzyp-1.a1.typesense.net",
      port: "443",
      protocol: "https",
    }
  ],
  apiKey: '6eYnFxM0OXjAqK23pym4VkINJZlGil2F',
  connectionTimeoutSeconds: 2
});

export default client;