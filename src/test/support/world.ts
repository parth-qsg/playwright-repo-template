import { World, IWorldOptions } from '@cucumber/cucumber';

export class CustomWorld extends World {
  context: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }
}
