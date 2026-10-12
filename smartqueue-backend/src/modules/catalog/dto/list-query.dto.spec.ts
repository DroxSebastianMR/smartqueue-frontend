import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import {
  CompactListQueryDto,
  ListQueryDto,
  paginate,
} from "@/modules/catalog/dto/list-query.dto";

describe("catalog pagination", () => {
  it("caps movies at ten and advertisements at five", () => {
    expect(
      validateSync(plainToInstance(ListQueryDto, { limit: 11 })),
    ).not.toHaveLength(0);
    expect(
      validateSync(plainToInstance(CompactListQueryDto, { limit: 6 })),
    ).not.toHaveLength(0);
    expect(
      validateSync(plainToInstance(ListQueryDto, { limit: 10, page: 1 })),
    ).toHaveLength(0);
    expect(
      validateSync(plainToInstance(CompactListQueryDto, { limit: 5, page: 1 })),
    ).toHaveLength(0);
  });

  it("returns a stable data/meta envelope", () => {
    expect(paginate([1, 2, 3], { page: 2, limit: 2 })).toEqual({
      data: [3],
      meta: { page: 2, limit: 2, count: 1, total: 3, hasNextPage: false },
    });
  });
});
