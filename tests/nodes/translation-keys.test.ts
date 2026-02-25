import { describe, it, expect } from 'vitest';
import i18next from 'i18next';

/**
 * Regression test for node description translation keys
 * 
 * Bug: Node descriptions were using incorrect i18n key format (dots instead of underscores).
 * For example, 'node.output.preview.description' instead of 'node.output.preview_description'.
 * This caused the property panel to show raw translation keys instead of translated text.
 * 
 * This test verifies that all node definitions have valid translation keys
 * that actually exist in the i18n files.
 */

describe('Node description translation keys - regression test', () => {
  // Import all node definitions
  const nodeModules = import.meta.glob('../../src/core/nodes/**/*.ts', { eager: true });
  
  // Collect all node definitions from the modules
  const getAllNodeDefinitions = () => {
    const nodes: Array<{ type: string; label: string; description?: string }> = [];
    
    for (const path in nodeModules) {
      const mod = nodeModules[path] as Record<string, any>;
      // Find all NodeTypeDefinition exports
      for (const key in mod) {
        const node = mod[key];
        if (node && typeof node === 'object' && node.type && node.label) {
          nodes.push({
            type: node.type,
            label: node.label,
            description: node.description,
          });
        }
      }
    }
    
    return nodes;
  };

  it('should have valid translation keys for all node descriptions', async () => {
    // Initialize i18next if not already done
    if (!i18next.isInitialized) {
      await i18next.init({
        lng: 'en',
        resources: {
          en: { translation: (await import('../../src/i18n/en.json')).default },
          zh: { translation: (await import('../../src/i18n/zh.json')).default },
        },
      });
    }
    
    const nodes = getAllNodeDefinitions();
    const nodesWithDescription = nodes.filter(n => n.description);
    
    // Should have nodes with descriptions
    expect(nodesWithDescription.length).toBeGreaterThan(0);
    
    // Check each node's description translation key
    const invalidKeys: string[] = [];
    
    for (const node of nodesWithDescription) {
      if (node.description) {
        // Try to translate the key - if it returns the same key, it means translation is missing
        const translated = i18next.t(node.description);
        
        // The translation should not equal the key itself (which would indicate missing translation)
        // Also check that it doesn't contain dots in a way that suggests wrong format
        if (translated === node.description || 
            (translated.includes('.') && !translated.includes('_'))) {
          invalidKeys.push(`${node.type}: "${node.description}" -> got "${translated}"`);
        }
      }
    }
    
    // Log for debugging
    if (invalidKeys.length > 0) {
      console.log('Invalid translation keys found:', invalidKeys);
    }
    
    expect(invalidKeys).toHaveLength(0);
  });

  it('should use underscore format for description translation keys', () => {
    const nodes = getAllNodeDefinitions();
    const nodesWithDescription = nodes.filter(n => n.description);
    
    // All description keys should use underscore format (e.g., node.adjust.brightness_contrast_description)
    // NOT dot format (e.g., node.adjust.brightness_contrast.description)
    const wrongFormatKeys = nodesWithDescription
      .filter(n => n.description && n.description.includes('.description'))
      .map(n => `${n.type}: ${n.description}`);
    
    if (wrongFormatKeys.length > 0) {
      console.log('Wrong format keys (should use _description not .description):', wrongFormatKeys);
    }
    
    expect(wrongFormatKeys).toHaveLength(0);
  });
});
