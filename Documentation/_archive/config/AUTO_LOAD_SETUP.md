# Auto-Load Configuration

Configure automatic project graph loading to save tokens.

## Three Setup Methods

### Method 1: Claude Code Settings (Easiest)
1. Settings → Context
2. Add: `Load: documentation/config/PROJECT_GRAPH.md`
3. Save

### Method 2: settings.json
```json
{
  "contextProviders": [{
    "type": "file",
    "path": "documentation/config/PROJECT_GRAPH.md",
    "autoLoad": true
  }]
}
```

### Method 3: Manual (Every Chat)
Paste at chat start:
```
Load: documentation/config/PROJECT_GRAPH.md
```

## Benefits
- 🎯 AI context ready instantly
- 💰 70-80% fewer tokens per chat
- 📖 Full docs available via links
- ⚡ Fast feature implementation

---
See: AI_WORKFLOW.md for how AI uses this
