import { NextApiRequest, NextApiResponse } from 'next';

const assetLinksData =[
      {
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
          "namespace": "android_app",
          "package_name": "fi.diversified.app",
          "sha256_cert_fingerprints":
              ["3C:FA:D2:28:66:BB:75:4C:F6:84:32:FE:9D:D7:AE:0D:AB:1A:16:81:B9:6A:59:63:52:C1:9C:7D:81:13:6F:A1"]
        }
      }
    ];

export default (_: NextApiRequest, response: NextApiResponse) => {
  return response.status(200).send(assetLinksData);
};
