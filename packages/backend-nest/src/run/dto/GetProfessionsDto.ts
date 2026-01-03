/**
 * 職業列表項目
 */
export class ProfessionListItemDto {
  id: string;
  name: {
    tw: string;
    en: string;
  };
  desc: {
    tw: string;
    en: string;
  };
}

/**
 * 職業列表回應 DTO
 */
export class GetProfessionsDto {
  success: boolean;
  data: ProfessionListItemDto[];
}
