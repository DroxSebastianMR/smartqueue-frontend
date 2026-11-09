import { Injectable } from "@nestjs/common";
import { ConcessionCategory, Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { paginate, type Page } from "@/modules/catalog/dto/list-query.dto";
import { type ListConcessionsQueryDto } from "@/modules/concessions/dto/list-concessions.query.dto";

export interface ConcessionProductView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ConcessionCategory;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  available: boolean;
  featured: boolean;
}

@Injectable()
export class ConcessionsService {
  constructor(private readonly db: PrismaService) {}

  async list(query: ListConcessionsQueryDto): Promise<Page<ConcessionProductView>> {
    const where: Prisma.ConcessionProductWhereInput = {
      available: true,
      ...(query.category ? { category: query.category } : {}),
      ...(query.featured === true ? { featured: true } : {}),
    };
    const products = await this.db.concessionProduct.findMany({
      where,
      orderBy: [{ featured: "desc" }, { priority: "asc" }, { name: "asc" }],
    });
    return paginate(products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      currency: product.currency,
      available: product.available,
      featured: product.featured,
    })), query);
  }
}
