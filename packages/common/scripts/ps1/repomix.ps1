cd "g:\Coding\app_harpy"
repomix --remove-comments --include "**/*.ts" --ignore "data/**" --style plain --output out/output_app.txt ./packages/game-core/src/application
repomix --remove-comments --include "**/*.ts" --ignore "data/**" --style plain --output out/output_domain.txt ./packages/game-core/src/domain
repomix --remove-comments --include "**/*.ts" --ignore "data/**" --style plain --output out/output_api.txt ./packages/backend-nest/src