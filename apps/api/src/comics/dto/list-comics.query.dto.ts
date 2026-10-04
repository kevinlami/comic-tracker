export class ListComicsQueryDto {
  search?: string;
  status?: string;
  order?: string;
  /** Nota exata (`1`…`5`) ou `none` para obras sem avaliação. */
  rating?: string;
  /** Id do site vinculado ou `none` para obras sem nenhum vínculo. */
  site?: string;
  /**
   * Situação dos sites vinculados: `active` (≥1 site ativo) ou
   * `inactive` (≥1 site desativado). Obras sem site não entram.
   */
  siteStatus?: string;
  /** Período sem leitura: `recent`, `1w`, `2w`, `1m` ou `never`. */
  inactive?: string;
}

