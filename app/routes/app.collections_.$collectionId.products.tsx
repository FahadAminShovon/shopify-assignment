import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { Button, Card, IndexTable, Layout, Page, Text } from "@shopify/polaris";
import React from "react";
import { authenticate } from "~/shopify.server";

export interface CollectionsResp {
  data: Data;
}
export interface Data {
  collection: Collection;
}
export interface Collection {
  products: Products;
}
export interface Products {
  edges?: EdgesEntity[] | null;
}
export interface EdgesEntity {
  node: Node;
}
export interface Node {
  title: string;
  description: string;
  id: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const collectionId = `gid://shopify/Collection/${params.collectionId}`;

  const response = await admin.graphql(
    `#graphql
			query($id: ID!) {
			  collection(id: $id) {
			    products(first: 100){
			      edges{
			        node{
			          title
			          description
								id
			        }
			      }
			    }
			  }
			}`,
    { variables: { id: collectionId } }
  );

  const {
    data: {
      collection: {
        products: { edges },
      },
    },
  } = (await response.json()) as CollectionsResp;
  const products = edges?.map((edge) => edge.node);
  return { products };
}

const Product = () => {
  const { products } = useLoaderData<typeof loader>() as { products: Node[] };

  const navigate = useNavigate();
  const params = useParams();

  const navigateToCreatePage = () => {
    navigate(`/app/collections/${params.collectionId}/product/create`);
  };
  const rowMarkup = products.map(({ id, title, description }, index) => (
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
    </IndexTable.Row>
  ));

  return (
    <Page>
      <ui-title-bar title="Products" />
      <Layout>
        <Layout.Section>
          <div className="flex justify-end">
            <Button onClick={navigateToCreatePage}>Create</Button>
          </div>
        </Layout.Section>
        <Layout.Section variant="fullWidth">
          <Card>
            <IndexTable
              selectable={false}
              headings={[{ title: "Name" }, { title: "Description" }]}
              itemCount={products.length}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Product;
