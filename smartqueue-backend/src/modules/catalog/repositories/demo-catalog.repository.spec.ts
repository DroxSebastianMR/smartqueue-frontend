import { DemoCatalogRepository } from "@/modules/catalog/repositories/demo-catalog.repository";

describe("demo catalog contract", () => {
  const repository = new DemoCatalogRepository();

  it("keeps the home collections separate and bounded", () => {
    expect(repository.listNowPlaying().length).toBeLessThanOrEqual(10);
    expect(repository.listUpcoming().length).toBeLessThanOrEqual(10);
    expect(repository.listAdvertisements().length).toBeLessThanOrEqual(5);
    expect(repository.listBanners()[0]?.movieSlug).toBe("avengers-doomsday");
    expect(
      repository.findMovie("avengers-doomsday")?.versions[0]?.audioLanguage,
    ).toBe("es-419");
    expect(repository.listTrailers("avengers-doomsday")[0]?.locale).toBe(
      "es-419",
    );
  });
});
