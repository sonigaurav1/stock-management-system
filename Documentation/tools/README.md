# Development Tools & Workflows

**AI workflows, agent guides, troubleshooting, and developer tools**

Documentation for development workflows, AI agent capabilities, and troubleshooting guidance.

---

## 
### Workflows
- **[AI_WORKFLOW.md](AI_WORKFLOW.md)** - AI development workflow
  - How to work with AI effectively
  - Prompt engineering
  - Context management
  - Best practices

- **[WORKSPACE_INSTRUCTIONS_README.md](WORKSPACE_INSTRUCTIONS_README.md)** - Workspace setup
  - VS Code configuration
  - Extension recommendations
  - Keyboard shortcuts
  - Productivity setup

### AI & Automation
- **[AGENT_GUIDE.md](AGENT_GUIDE.md)** - AI agent capabilities
  - What agents can do
  - Agent types and specialties
  - How to use agents effectively
  - Limitations and constraints

### Support & Reference
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
  - Debugging techniques
  - Common problems
  - Solutions and workarounds
  - When to ask for help

---

## 
### Using AI Effectively

**Good Prompts**:
- "I'm implementing a product form. Show me the pattern from CODE-PATTERNS.md"
- "Debug this error message: [error]"
- "Review this code for security issues"

**Bad Prompts**:
- "Fix this" (too vague)
- "Make it better" (no context)
- "What should I do?" (no specifics)

See [AI_WORKFLOW.md](AI_WORKFLOW.md) for detailed guidance.

### Agent Capabilities

**Explore Agent**: Research and investigation
- Codebase exploration
- Finding patterns
- Dependency analysis

**Task Agent**: Command execution
- Running tests
- Building
- Installing dependencies

**Code Review Agent**: Code analysis
- Security review
- Bug detection
- Pattern matching

See [AGENT_GUIDE.md](AGENT_GUIDE.md) for all agent types.

---

## 
### Recommended Extensions
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- Thunder Client / REST Client
- Database Client (for Convex)

See [WORKSPACE_INSTRUCTIONS_README.md](WORKSPACE_INSTRUCTIONS_README.md) for setup.

### Useful Commands

```bash
# Linting
pnpm run lint               # Check for issues
pnpm run lint:fix          # Fix issues

# Building & Type Checking
pnpm run type-check        # Check TypeScript
pnpm run build             # Build for production
pnpm run build:analyze     # Analyze bundle

# Testing
pnpm run test              # Run tests
pnpm run test:watch        # Watch mode

# Development
pnpm run dev               # Start dev server
pnpm run convex            # Start Convex dev

# Formatting
pnpm run format            # Format code
```

---

## 
### Common Issues

**Module not found**
 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md#module-errors)

**Type errors**
 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md#type-errors)

**Build failing**
 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md#build-errors)

**Runtime errors**
 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md#runtime-errors)

**Performance issues**
 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md#performance)

---

## 
```
tools/
 README. YOU ARE HEREmd                            
 AI development guide
 AI agent capabilities
 Common issues
 Workspace setup
```

---

## 
### For AI Development
1. Read: [AI_WORKFLOW.md](AI_WORKFLOW.md)
2. Reference: [AGENT_GUIDE.md](AGENT_GUIDE.md)
3. Use agents effectively for your task

### For Workspace Setup
1. Read: [WORKSPACE_INSTRUCTIONS_README.md](WORKSPACE_INSTRUCTIONS_README.md)
2. Install recommended extensions
3. Configure keyboard shortcuts

### For Debugging
1. Check: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Search for your error
3. Follow solution steps
4. If still stuck, ask for help

---

## 
### Debugging
- Use browser DevTools console
- Check Convex dashboard for database issues
- Use `console.log` strategically
- Use debugger breakpoints
- Read full error messages

### Performance
- Use React DevTools Profiler
- Check Network tab for large payloads
- Monitor Convex query performance
- Use proper indexes
- Lazy load components

### Development
- Keep dev servers running
- Use hot reload effectively
- Test frequently
- Commit often
- Review code before pushing

---

## 
| Need | Go To |
|------|-------|
| Development | [../getting-started/](../getting-started/) |
| Code patterns | [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md) |
| Conventions | [../reference/CONVENTIONS.md](../reference/CONVENTIONS.md) |
| Setup | [../setup/](../setup/) |
| Architecture | [../reference/ARCHITECTURE.md](../reference/ARCHITECTURE.md) |

---

 Common Questions## 

**Q: How do I debug efficiently?**
A: Use browser DevTools, check console logs, and use breakpoints. See TROUBLESHOOTING.md.

**Q: What extensions should I install?**
A: See WORKSPACE_INSTRUCTIONS_README.md for full list and setup.

**Q: How do I work effectively with AI?**
A: Read AI_WORKFLOW.md for best practices.

**Q: I'm getting an error, what do I do?**
A: Check TROUBLESHOOTING.md for your error type.

**Q: Can I use agents for my task?**
A: Check AGENT_GUIDE.md to see if applicable.

---

**Last Updated**: 2026-05-10  
**Maintained By**: Developer Tools Team  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
