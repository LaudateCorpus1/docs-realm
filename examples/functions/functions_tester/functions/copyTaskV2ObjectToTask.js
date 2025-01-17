// :code-block-start: copyTaskV2Object
exports = function (changeEvent) {
  const db = context.services.get("mongodb-atlas").db("ExampleDB");
  const collection = db.collection("TaskV2");
  // The changed document's _id as a string:
  const changedDocId = changeEvent.documentKey._id;
  // If a document in the TaskV2 collection has been deleted, 
  // delete the equivalent object in the Task collection
  if (changeEvent.operationType === "delete") {
    const taskCollection = db.collection("Task");
    // Convert the deleted document's _id to an integer value
    // to match Task's schema:
    const deletedDocumentID = parseInt(changedDocId);
    return taskCollection.deleteOne({ _id: deletedDocumentID })
  }
  // A document in the Task collection has been created, 
  // modified, or replaced, so create a pipeline to handle the change:
  const pipeline = [
    // Find the changed document data in the Task collection
    { $match: { _id: changedDocId } },
    {
      // Transform the document by changing the _id field
      $addFields: {
        _id: { $toInt: "$_id" },
      },
    },
    { $merge: "Task" }
  ]
  return collection.aggregate(pipeline);
};
// :code-block-end: