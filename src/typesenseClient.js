import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: "b84zp19gdc3xnmvsp-1.a1.typesense.net",
      port: "443",
      protocol: "https",
}
  ],
  apiKey: 'ft3WP2RCmRa2c7bsleaE8CeDzOCOyXI3',
  connectionTimeoutSeconds: 2
});

export default client;