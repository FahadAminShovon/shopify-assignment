import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Button, Card, Layout, Page, TextField } from "@shopify/polaris";
import React, { useState } from "react";
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

  console.log(title, description);
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
  const { title: defaultTitle, description: defaultDescription } =
    useLoaderData<typeof loader>();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  return (
    <Page>
      <Layout></Layout>
      <Layout.Section>
        <Card>
          <Form
            method="POST"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <TextField
              name="title"
              label="Title"
              autoComplete="false"
              value={title}
              onChange={(val) => {
                setTitle(val);
              }}
            />
            <TextField
              name="description"
              label="Description"
              autoComplete="false"
              value={description}
              onChange={(val) => {
                setDescription(val);
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 8,
                justifyContent: "flex-end",
              }}
            >
              <Button variant="primary" submit>
                Update
              </Button>
            </div>
          </Form>
        </Card>
      </Layout.Section>
    </Page>
  );
};

export default Edit;
