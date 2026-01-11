cd "g:\Coding\app_harpy"

# Application
repomix --remove-comments --include "**/*.ts" --ignore "data/**,**/__tests__/**,**/*.spec.ts" --style plain --output out/output_app.txt ./packages/game-core/src/application

# Domain
repomix --remove-comments --include "**/*.ts" --ignore "data/**,**/__tests__/**,**/*.spec.ts" --style plain --output out/output_domain.txt ./packages/game-core/src/domain

# API (Backend Nest)
repomix --remove-comments --include "**/*.ts" --ignore "data/**,**/__tests__/**,**/*.spec.ts" --style plain --output out/output_api.txt ./packages/backend-nest/src