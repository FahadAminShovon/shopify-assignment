import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";
import CreateEditForm from "~/components/CreateEditForm";
import { authenticate } from "~/shopify.server";

export interface ProductSuccessResp {
  data: Data;
}
export interface Data {
  product: Product;
}
export interface Product {
  title: string;
  description: string;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const productId = `gid://shopify/Product/${params.productId}`;

  await admin.graphql(
    `#graphql
 	mutation productUpdate($id:ID!, $title: String!, $description: String ) {
    productUpdate(input: {id: $id, title:$title, descriptionHtml: $description }) {
      product {
        title
        description
      }
   }
  }`,
    {
      variables: {
        id: productId,
        title,
        description: `<p>${description}</p>`,
      },
    }
  );

  return redirect(`/app/collections/${params.collectionId}/products`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const productId = `gid://shopify/Product/${params.productId}`;

  const response = await admin.graphql(
    `#graphql
			query($id: ID!) {
			  product(id: $id) {
					title
					description
			  }
			}`,
    { variables: { id: productId } }
  );

  const {
    data: {
      product: { title, description },
    },
  } = (await response.json()) as ProductSuccessResp;

  return json({ title, description });
}

const EditProduct = () => {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <Page>
      <ui-title-bar title="Edit Product" />
      <Layout>
        <Layout.Section>
          <Card>
            <CreateEditForm
              buttonText="Update"
              defaultDescription={description}
              defaultTitle={title}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default EditProduct;
