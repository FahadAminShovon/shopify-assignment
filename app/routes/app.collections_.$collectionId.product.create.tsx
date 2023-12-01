import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";
import CreateEditForm from "~/components/CreateEditForm";

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
