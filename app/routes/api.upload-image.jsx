import { authenticate } from "../shopify.server";
import { info } from "../utils/logger.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    info("Uploading file:", file);
    info(file);
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 1: Create staged upload
    const stagedUploadCreateResponse = await admin.graphql(
      `#graphql
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: [
            {
              filename: file.name,
              mimeType: file.type,
              httpMethod: "POST",
              resource: "FILE",
            },
          ],
        },
      },
    );

    const stagedUploadData = await stagedUploadCreateResponse.json();
    const stagedTarget =
      stagedUploadData.data.stagedUploadsCreate.stagedTargets[0];

    if (!stagedTarget) {
      throw new Error("Failed to create staged upload");
    }

    // Step 2: Upload file to staged URL
    const uploadFormData = new FormData();
    stagedTarget.parameters.forEach(({ name, value }) => {
      uploadFormData.append(name, value);
    });
    uploadFormData.append("file", file);

    const uploadResponse = await fetch(stagedTarget.url, {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to staged URL");
    }


    info('stagedTarget.resourceUrl')
    info(stagedTarget.resourceUrl)

    // Step 3: Create file
    const fileCreateResponse = await admin.graphql(
      `#graphql
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            alt
            preview{
              image { 
                url 
                altText
              }
              status
            }
            ... on MediaImage {
              image {
                width
                height
                url
                altText
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          files: [
            {
              alt: file.name,
              contentType: "IMAGE",
              originalSource: stagedTarget.resourceUrl,
            },
          ],
        },
      },
    );

    const fileCreateData = await fileCreateResponse.json();
    info("fileCreateData response:");
    info(fileCreateData.data);

    const createdFile = fileCreateData.data.fileCreate.files[0];

    info("createdFile response:");
    info(createdFile);

    if (!createdFile) {
      throw new Error("Failed to create file");
    }

    return new Response(
      JSON.stringify({ success: true, url: createdFile.url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
