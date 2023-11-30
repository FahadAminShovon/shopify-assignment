import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, Page, Text, BlockStack } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: DataFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
		query {
			shop {
				name
    		id
			}
		}`
  );

  const {
    data: {
      shop: { name: shopname, id: shopId },
    },
  } = await response.json();

  return json({ shopId, shopname });
}

export default function AdditionalPage() {
  const { shopId, shopname } = useLoaderData<typeof loader>();

  return (
    <Page>
      <ui-title-bar title="Shop" />
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingXl">
                {shopname}
              </Text>
              <Text as="p" variant="bodyMd">
                {shopId}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
