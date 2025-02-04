console.log("🚀 jest.setup.js is loaded");

global.DataTransfer = class {
  constructor() {
    this.items = [];
  }

  add(file) {
    this.items.push(file);
  }
};

console.log("🚀 jest.setup.js: DataTransfer is set");
