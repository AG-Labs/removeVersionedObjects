const {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "eu-west-2" });
const bucket = "cdk-hnb659fds-assets-133238538690-eu-west-2";

let results = [];

const params = {
  Bucket: bucket,
};

async function deleteObjectVersions() {
  try {
    // List object versions
    const response = await s3Client.send(new ListObjectVersionsCommand(params));

    for (const version of response.DeleteMarkers) {
      results.push({ Key: version.Key, VersionId: version.VersionId });
      const matchingObjects = response.Versions.filter(
        (item) => item.Key === version.Key
      );
      results.push(
        ...matchingObjects.map((item) => ({
          Key: item.Key,
          VersionId: item.VersionId,
        }))
      );
    }

    // Delete each version
    for (const version of results) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: version.Key,
          VersionId: version.VersionId,
        })
      );
    }
  } catch (error) {
    console.error("Error deleting object versions:", error);
  }
}

deleteObjectVersions();
