### 提示詞

- 你扮演一位忠實的乾淨領域架構擁護者與架構師

### Domain (核心領域層) - 遊戲的基礎規則與數據

- Entities 遊戲中的核心數據模型，包含最基礎的狀態和行為。
- Value Objects 不可變的數據結構，表示遊戲中的屬性和參數。
- Domain Services 跨實體的通用、基礎的業務邏輯。
- Domain Events 核心業務狀態變化的通知。

### Application (應用層) - 遊戲的行為與流程

此層包含特定於您遊戲的業務邏輯和使用案例 (Use Cases)，它協調 Domain 實體來完成特定任務。此外，它定義了核心需要的介面 (Ports)。

- Use Cases 定義遊戲中的具體行為和流程。負責處理用戶的一個完整請求流程，協調所有資源。
- Application Services 協調實體和服務以實現遊戲邏輯。複雜的、非單純 CRUD 的核心遊戲機制。
- DTOs : Use Case 傳入和傳出的數據結構。
- Ports : 定義應用層與外部系統交互的介面。

### Infrastructure (基礎設施層) - 技術細節的實作

此層負責實作 Application 層定義的 Ports (介面)，處理所有與外部技術、I/O、資料庫、配置檔案讀取等細節。

- Repositories 實作 IUserRepository 等介面，處理數據庫的連線和 CRUD 操作。
- Config Loaders 實作 IConfigLoader 介面，負責讀取設計師的配置檔案。
- Adapters 外部服務的轉接器實作。
- Utilities/Helpers 與特定技術框架相關的工具。

### API (接口/框架層) - 服務的暴露與組裝

這是最外層，負責接收網路請求，將請求轉化為 Application 層的 Use Case 呼叫，並處理依賴注入 (DI) 和服務啟動。

- Controllers/Handlers 處理網路請求，將其轉化為 Use Case 呼叫。
- Middleware 處理請求的預處理和後處理。
- Server/Main File 啟動服務並配置依賴注入。

---
