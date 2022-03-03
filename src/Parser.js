// The entry when a user has not provided a value in response
const NO_RESPONSE = '_No response_';

module.exports = class Parser {

  constructor(separator, openTag, closeTag) {
    this._config = {
      separator: separator,
      tag: {
        open: openTag,
        close: closeTag
      }
    }
  }

  get separator() {
    return this._config.separator;
  }

  get tagRegex() {
    const open = this._config.tag.open
      , close = this._config.tag.close
      , regexMatch = `${open}(.*)${close}(?:\\s)+(.*)`
      ;

    const tagRegex = new RegExp(regexMatch, 'sm');
    return tagRegex;
  }

  get checkBoxRegex() {
    const regexMatch = `\\- \\[(\\s|X|x)\\] (.*)`;
    return new RegExp(regexMatch);
  }

  get SpiderListRegex() {
    const regexMatch = `\\- id:\\s*([\\d]+)\\s*\\|\\s*name:\\s*([\\w]+)\\s*(:?\\|\\s*project_id:\\s*(\\d+))?`;
    return new RegExp(regexMatch);
  }

  get ListRegex() {
    const regexMatch = `^\\- (.*)`;
    return new RegExp(regexMatch);
  }

  get LinkRegex() {
    const regexMatch = `^\\- \\[([^\\]]+)\\]\\((.*)\\)`;
    // const regexMatch = `\- \[([^\]]+)\]\((.*)\)`;
    return new RegExp(regexMatch);
  }



  parse(content) {
    if (!content || content.trim().length === 0) {
      return undefined;
    }

    // Split up the payload on the specified line separator
    const parts = content.split(this.separator);

    const result = {};
    if (parts) {
      const tagRegex = this.tagRegex;
      const checkBoxRegex = this.checkBoxRegex;
      const SpiderListRegex = this.SpiderListRegex;
      const ListRegex = this.ListRegex;
      const LinkRegex = this.LinkRegex;


      parts.forEach(part => {
        const tagMatch = tagRegex.exec(part);

        if (tagMatch) {
          const value = tagMatch[2].trim();

          if (value === NO_RESPONSE) {
            // no reponse provided in the payload, report no value
            result[tagMatch[1]] = undefined;
          } else if (checkBoxRegex.exec(value)) {
            // We may have a checkboxes that need to be parsed so check for those
            // Split the content as we may have multiple lines of checkboxes
            const contentLines = value.split('\n');
            const checkboxData = {};

            contentLines.forEach(line => {
              const parsed = checkBoxRegex.exec(line);
              if (parsed) {
                checkboxData[parsed[2]] = parsed[1] === 'X' || parsed[1] === 'x';
              }
            });
            result[tagMatch[1]] = checkboxData;
          } else if (SpiderListRegex.exec(value)) {
            // Split the content as we may have multiple lines of checkboxes
            const contentLines = value.split('\n');
            const SpidersData = {};

            contentLines.forEach(line => {
              const parsed = SpiderListRegex.exec(line);
              if (parsed) {
                const spider = {}
                spider["id"] = parsed[1]
                spider["name"] = parsed[2]
                spider["project_id"] = parsed[4]
                SpidersData[parsed[1]] = spider
              }
            });
            result[tagMatch[1]] = SpidersData;
          } else if (this.ListRegex.exec(value)) {
            // Split the content as we may have multiple lines of checkboxes
            const contentLines = value.split('\n');
            const points = [];
            const links ={};
            

            contentLines.forEach(line => {
              if(line){
                if (LinkRegex.exec(line)){
                  const parsed = LinkRegex.exec(line);
                  links[parsed[1]] = parsed[2]
                }else {
                  const parsed = ListRegex.exec(line);
                  points.push(parsed[1])
                }
              }
              
            });
            const output = {"links": links, "points": points}
            result[tagMatch[1]] = output;
          }
          else {
            result[tagMatch[1]] = value;
          }


        }
      });
    }

    return result;
  }
}