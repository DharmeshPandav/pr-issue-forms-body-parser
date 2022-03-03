# PR/Issue-forms-body-parser

GitHub Action that will parse the issue body that has been generated from an Issue Form Template.

The purpose of this action is to take the collected input from the user (ideally nothing overly free form to make it difficult to parse) and return the parsed results into a JSON encoded object.

To achieve this, we need to define a separator and some markers for the opening/closing of the label for the value provided by the user.

Currently as of writing this, the Issue form templates will use the h3 header `###` in the markdown as the separator.

It is then up to the person defining the labels to use a consistent open/close marker for all the form entries being collected from the user in the Issue Template.

So in this example if I was to use `>>` and `<<` characters to enclose the labels for the various inputs/fields in the template, we can later parse the generated issue body that would be created:

```
### >>>Description<<<

Demo PR


### >>>Spiders<<<

- id:1|name:abc|project_id:1234

- id:2|name:def|project_id:5678

- id:3|name:xyz

### >>>Links<<<

- http://localhost.con

- [data ui](http://localhost.con)
```

## Parameters

|Input                      | Required | Description                             |
| --------------------------| -------- | ------------------------------- |
| `github_token`            | `true`   | PAT(Personal Access Token) for accessing the issues on the repository, defaults to `${{ github.token }}`. |
| `issue_id`                | `true`   | The id of the issue to load the content from.|
| `separator`               | `false`  | The separator between the fields defaults to `###` which is markdown h3 which GitHub is currently defaulting to |
| `label_marker_start`      | `true`   | The characters to match for the beginning of a label |
| `label_marker_end`        | `true`   | The characters to match for the ending of a label |


## Usage

Usage to parse the message example above:

```
steps:
  - name: Run PR/Issue form parser
    id: parse
    uses: DharmeshPandav/pr-issue-forms-body-parser@v0.1
    with:
      issue_id: ${{ github.event.number}}
      separator: "###"
      label_marker_start: ">>"
      label_marker_end: "<<"

  - name: Show parsed data JSON
    run: |
      echo "${{ steps.parse.outputs.payload }}"
```

The JSON payload that is extracted would look like this:

```json
{
  "Description": "Demo PR",
  "Spiders": {
    "1": { "id": "1", "name": "abc", "project_id": "1234" },
    "2": { "id": "2", "name": "def", "project_id": "5678" },
    "3": { "id": "3", "name": "xyz", "project_id": undefined }
  },
  "Links": {
    "links": { "data ui": "http://localhost.con" },
    "points": [ "http://localhost.con" ]
  }
}
```
