# @layerhq/web-xdk-quick-replies

* This is an unsupported rough draft exploring Quick Replies *

To add Quick Replies to a project:

1. `npm install @layerhq/web-xdk-quick-replies`
2. Add `import '@layerhq/web-xdk-quick-replies'` anywhere prior to calling `Layer.init()`
3. Add an event listener to the `document` listening for `layer-quick-replies-update`
4. Use your event listener to call `quickRepliesWidth.showItems([quick-replies-to-show-the-user])`


A simple example shows an event listener that listens for Image Messages, and on receiving one prompts the user to either give a thumbs up, thumbs down, or random innane comment:

```javascript
document.addEventListener('layer-quick-replies-update', function(evt) {
  const quickRepliesWidget = evt.target;
  const newMessage = evt.detail.message;
  const model = newMessage.createModel();
  if (model.getModelName() === 'ImageModel') {
    quickRepliesWidget.showItems([
      {
        text: "👍",
        model: new TextModel({text: "👍"})
      },
      {
        text: "👎",
        model: new TextModel({text: "👎"})
      },
      {
        text: "Tis only a flesh wound",
        model: new ImageModel({
          title: "Tis only a flesh wound",
          sourceUrl: "https://78.media.tumblr.com/1b019b4237ab18f789381941eca98784/tumblr_nlmlir7Lhk1u0k6deo1_400.gif",
          artist: "Monty Python"
        })
      }
    ]);
  }
});
```

Alternatively, you may embed quick reply options in the message itself with a Message Part that looks like:
```javascript
{
   mime_type: 'application/vnd.custom.quickreplies+json',
   body: JSON.stringify([{
     text: "Hello",
     modelName: 'TextModel',
     data: { text: "Hello there!" }
   }, {
     text: "Sunrise",
     modelName: 'ImageModel',
     data: { sourceUrl: "https://somepictures.com/sunrise.jpg" }
   }]);
}
```

Then on receiving a Message with such a part, our event handler would look like:

```javascript
document.addEventListener('layer-quick-replies-update', function(evt) {
   const quickRepliesWidget = evt.target;
   const newMessage = evt.detail.message;
   const quickRepliesPart = newMessage.filterParts(part => part.mimeType === 'application/vnd.custom.quickreplies+json');
   if (quickRepliesPart) {
     const replies = JSON.parse(quickRepliesPart.body);
     quickRepliesWidget.showItems(replies.map(replyData => {
       const modelName = replyData.modelName
       const modelClass = Layer.Core.Client.getMessageTypeModelClass(modelName);
       const model = new modelClass(replyData.props);
       return { model, text: replyData.text };
     });
   }
});
```