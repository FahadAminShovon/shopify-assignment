import { Form } from "@remix-run/react";
import { Button, TextField } from "@shopify/polaris";
import React, { useState } from "react";

type PropType = {
  defaultTitle?: string;
  defaultDescription?: string;
  buttonText: string;
};
const CreateEditForm = ({
  defaultDescription,
  defaultTitle,
  buttonText,
}: PropType) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);

  return (
    <Form method="POST" className="flex flex-col gap-2">
      <TextField
        name="title"
        label="Title"
        autoComplete="false"
        value={title}
        onChange={(val) => {
          setTitle(val);
        }}
        placeholder="Enter title"
      />
      <TextField
        name="description"
        label="Description"
        autoComplete="false"
        value={description}
        placeholder="Enter description"
        onChange={(val) => {
          setDescription(val);
        }}
      />
      <div className="flex justify-end gap-2">
        <Button variant="primary" submit>
          {buttonText}
        </Button>
      </div>
    </Form>
  );
};

export default CreateEditForm;
