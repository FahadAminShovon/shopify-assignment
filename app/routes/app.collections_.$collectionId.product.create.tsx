import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";
import CreateEditForm from "~/components/CreateEditForm";
import { authenticate } from "~/shopify.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const collectionId = `gid://shopify/Collection/${params.collectionId}`;

  await admin.graphql(
    `#graphql
		mutation productCreate($input: ProductInput!) {
		  productCreate(input: $input) {
		    product {
		      # Product fields
					id	
		    }
		  }
		}`,
    {
      variables: {
        input: {
          title,
          descriptionHtml: `<p>${description}</p>`,
          collectionsToJoin: [collectionId],
        },
      },
    }
  );

  return redirect(`/app/collections/${params.collectionId}/products`);
}

const CreateProduct = () => {
  return (
    <Page>
      <ui-title-bar title="Create Product" />
      <Layout>
        <Layout.Section>
          <Card>
            <CreateEditForm buttonText="Create" />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CreateProduct;
