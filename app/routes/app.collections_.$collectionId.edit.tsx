import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, Page } from "@shopify/polaris";
import CreateEditForm from "~/components/CreateEditForm";
import { authenticate } from "~/shopify.server";

export interface CollectionDataResp {
  data: Data;
}
export interface Data {
  collection: Collection;
}
export interface Collection {
  title: string;
  description: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const collectionId = `gid://shopify/Collection/${params.collectionId}`;

  const response = await admin.graphql(
    `#graphql
			query($id: ID!) {
			  collection(id: $id) {
					title
					description
		  }
			}`,
    { variables: { id: collectionId } }
  );

  const data = (await response.json()) as CollectionDataResp;
  return json({
    title: data.data.collection.title,
    description: data.data.collection.description,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const collectionId = `gid://shopify/Collection/${params.collectionId}`;

  await admin.graphql(
    `#graphql
 	mutation updateCollectionHandle($id:ID!, $title: String!, $description: String ) {
    collectionUpdate(input: {id: $id, title:$title, descriptionHtml: $description }) {
      collection {
        id
        title
        description
        productsCount
        handle
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        id: collectionId,
        title,
        description: `<p>${description}</p>`,
      },
    }
  );

  return redirect("/app/collections");
}

const Edit = () => {
  const { title, description } = useLoaderData<typeof loader>();
  return (
    <Page>
      <Layout.Section>
        <Card>
          <CreateEditForm
            defaultTitle={title}
            defaultDescription={description}
            buttonText="Update"
          />
        </Card>
      </Layout.Section>
    </Page>
  );
};

export default Edit;
