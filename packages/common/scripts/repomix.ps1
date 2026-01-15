cd "g:\Coding\app_harpy"
# cd "C:\Users\wits\Desktop\GitRepo\app_harpy"
# 定義配置數組，每個項目包含名稱、輸出文件名和路徑
$configs = @(
    # @{ Output = "out/output_app.txt"; Path = "./packages/xo-c/src/application" },
    # @{ Output = "out/output_domain.txt"; Path = "./packages/xo-c/src/domain" },
    @{ Output = "out/output_api.txt"; Path = "./packages/xo-b/src" }
    @{ Output = "out/output_auth.txt"; Path = "./packages/xo-b/src/features/auth" }
)

# 使用 foreach 循環執行每個配置
foreach ($config in $configs) {
    # --compress
    repomix --remove-comments --remove-empty-lines --include "**/*.ts,**/*.tsx" --ignore "data/**,**/__tests__/**,**/*.spec.ts" --style plain --output $($config.Output) $($config.Path)
}