# aws-feature-toggle

Tag based feature toggle

This works by polling your EC2 instance tag and maintaining an internal cache, so 
that you can query it to understand if a feature toggle should be enabled.

You have to specify a comma separated list of features that you want to be enabled as value
of a tag called feature-toggle.

## Installation

`npm install aws-feature-toggle`

## Usage

You start it wherever you app starts passing the instance-id, like so

```javascript
var ft = require('aws-feature-toggle');

ft.start('i-h725');
```

You can override the 1 minute poll interval by passing a millisecond value as
second parameter to `start`, like so

```javascript
var ft = require('aws-feature-toggle');

ft.start('i-h725', 120000);
```

## Running tests

`npm test`
