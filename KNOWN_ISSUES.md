# Known Issues

## Realm Native Module on Node 20

**Issue**: The `realm` npm package (v12.x) is deprecated and has issues with Node 20.x.

**Symptoms**:
```
Error: Cannot find module '/path/to/node_modules/realm/prebuilds/node/realm.node'
```

**Workarounds**:

### Option 1: Use Node 18 (Recommended for Now)
```bash
nvm install 18
nvm use 18
npm install
npm run build
```

### Option 2: Use @realm/community Package (Future)
The realm team recommends migrating to `@realm/community` package. This will be addressed in a future update.

### Option 3: Work Without Realm Parsing
The forensic toolkit modules work independently. You can use:
- Acquisition module
- Chrome/Safari parsers
- Google Takeout parser
- Social media parsers
- Timeline reconstruction
- Reporting

Simply avoid using the `parse realm` command until Realm support is updated.

## Testing Without Realm

The unit tests work fine as they don't require the Realm native module:
```bash
npm test  # This works fine
```

## Future Resolution

We will migrate to `@realm/community` or provide an alternative Realm parser in a future update.
