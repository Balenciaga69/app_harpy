# cd "g:\Coding\app_harpy"
cd "C:\Users\wits\Desktop\GitRepo\app_harpy"
# 定義配置數組，每個項目包含名稱、輸出文件名和路徑
$configs = @(
    # @{ Output = "out/output_app.txt"; Path = "./packages/game-core/src/application" },
    # @{ Output = "out/output_domain.txt"; Path = "./packages/game-core/src/domain" },
    @{ Output = "out/output_api.txt"; Path = "./packages/backend-nest/src" }
)

# 使用 foreach 循環執行每個配置
foreach ($config in $configs) {
    repomix --remove-comments --include "**/*.ts" --ignore "data/**,**/__tests__/**,**/*.spec.ts" --style plain --output $($config.Output) $($config.Path)
}