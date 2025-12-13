# Effect 模組

## 簡介

Effect 模組負責管理角色的效果系統，包括靜態屬性效果、類別效果和堆疊效果。支援效果的動態應用、移除和生命週期鉤子，提供靈活的效果管理機制。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- IEffectTemplateInfo：效果模板資訊，用於建構效果實例。
- IEffect：效果實例，包含應用和移除邏輯。

### 主要輸出

- IEffect[]：建構後的效果實例列表。
- 效果管理操作：添加、移除、查詢和觸發效果。

## 元件盤點

- EffectManager：效果管理器，處理效果的添加、移除和狀態觸發。
- EffectBuilder：效果建構器，根據模板建構靜態或類別效果。
- ClassEffectRegistry：類別效果註冊表，管理類別效果的建構函數。
- StaticEffectGenerator：靜態效果生成器，根據模板生成屬性修飾效果。
- StackableEffect：堆疊效果基類，支持效果層數管理。
- StaticAttributeEffect：靜態屬性效果類，應用固定屬性修飾。
- 介面層：定義IEffect、IEffectServices等契約，確保元件間一致性。
- 錯誤處理：EffectBuilderError等，自訂錯誤類別。

## 模組依賴誰?或被誰依賴?

Effect 模組依賴 attribute 模組的屬性修飾器和類型定義，以及 combat 模組的效果服務介面。Effect 模組被 combat 模組依賴，用於戰鬥效果應用，以及 item 模組依賴，用於裝備和遺物效果生成。
