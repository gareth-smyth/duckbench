import { Plugin, PluginConfig } from "../../types";
import Communicator from "../../builder/Communicator";

export type RedirectInputFileConfig = PluginConfig & {
  name: "RedirectInputFile";
};

export default class RedirectInputFile
  implements Plugin<RedirectInputFileConfig>
{
  structure() {
    return {
      name: "RedirectInputFile",
      label: "Creates a file of text separated by newlines",
      description:
        "Creates a file that can be directed as input " +
        "to simulate the user hitting the keys",
      type: "internal",
    };
  }

  async createInput(
    arrayOfInput: string[],
    communicator: Communicator,
    location = "ram:tmp_input",
  ) {
    await communicator.echo(arrayOfInput.join("*n") + "*n", {
      REDIRECT_OUT: location,
    });
    return location;
  }
}
