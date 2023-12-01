import React from "react";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Card, Layout, Page } from "@shopify/polaris";
import CreateEditForm from "~/components/CreateEditForm";
import { authenticate } from "~/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");

  await admin.graphql(
    `#graphql
	mutation collectionCreate($title: String!, $description: String ) {
    collectionCreate(input: {title:$title, descriptionHtml: $description }) {
      collection {
        id
        title
        description
			}
    }
  }`,
    {
      variables: {
        title,
        description: `<p>${description}</p>`,
      },
    }
  );

  return redirect("/app/collections");
}

const CreateCollection = () => {
  return (
    <Page>
      <ui-title-bar title="Create Collection" />
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

export default CreateCollection;
