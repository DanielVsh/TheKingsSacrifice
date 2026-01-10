export interface SortInfo {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageableInfo {
  pageNumber: number
  pageSize: number
  offset: number
  paged: boolean
  unpaged: boolean
  sort: SortInfo
}

export interface Page<T> {
  content: T[]
  pageable: PageableInfo

  totalElements: number
  totalPages: number

  size: number
  number: number
  numberOfElements: number

  first: boolean
  last: boolean
  empty: boolean

  sort: SortInfo
}