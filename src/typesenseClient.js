import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: "b84zp19gdc3xnmvsp-1.a1.typesense.net",
      port: "443",
      protocol: "https",
}
  ],
  apiKey: 'FWcZRbFG8NgnblvJnsG65XMvpt0H1vPr',
  connectionTimeoutSeconds: 2
});

export default client;