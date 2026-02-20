import { NodeTypeDefinition } from './types';

class NodeRegistry {
  private definitions: Map<string, NodeTypeDefinition> = new Map();

  register(definition: NodeTypeDefinition): void {
    if (this.definitions.has(definition.type)) {
      console.warn(`Node type "${definition.type}" is already registered. Overwriting.`);
    }
    this.definitions.set(definition.type, definition);
    console.log(`Registered node: ${definition.type}`);
  }

  get(type: string): NodeTypeDefinition | undefined {
    return this.definitions.get(type);
  }

  getByCategory(category: string): NodeTypeDefinition[] {
    return Array.from(this.definitions.values()).filter(
      (node) => node.category === category
    );
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.definitions.forEach((node) => categories.add(node.category));
    return Array.from(categories);
  }

  getAll(): NodeTypeDefinition[] {
    return Array.from(this.definitions.values());
  }
}

export const nodeRegistry = new NodeRegistry();
