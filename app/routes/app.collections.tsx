import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  IndexTable,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import React from "react";
import { authenticate } from "~/shopify.server";
export interface CollectionsResp {
  data: Data;
}
export interface Data {
  collections: Collections;
}
export interface Collections {
  edges?: EdgesEntity[] | null;
}
export interface EdgesEntity {
  node: Node;
}
export interface Node {
  id: string;
  title: string;
  description: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
			query {
			  collections(first: 100) {
			    edges {
			      node {
			        id
			        title
			        description
			      }
			    }
			  }
			}
		`
  );

  const data: CollectionsResp = await response.json();
  const collections =
    data.data.collections.edges?.map((edge) => edge.node) ?? [];
  return json({ collections });
}

const Collections = () => {
  const { collections } = useLoaderData<typeof loader>() as {
    collections: Node[];
  };

  const rowMarkup = collections.map(({ id, title, description }, index) => (
    <IndexTable.Row id={id} key={id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {description}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Box>
          <Button>Edit</Button>
          <Button>Products</Button>
        </Box>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page>
      <ui-title-bar title="Collections" />
      <Layout>
        <Layout.Section variant="fullWidth">
          <Card>
            <IndexTable
              selectable={false}
              headings={[
                { title: "Name" },
                { title: "Description" },
                { title: "Actions" },
              ]}
              itemCount={collections.length}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Collections;
