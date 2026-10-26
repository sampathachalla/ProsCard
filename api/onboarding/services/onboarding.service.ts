import type { OnboardingRepository } from '../repository/onboarding.repository.js';
import { HttpError } from '../../src/errors.js';
import type { GenerateProfileCopyInput } from '../utils/onboarding.schemas.js';
import type { ProfileCopywriterGateway } from './openai-profile-copywriter.service.js';
const shape=(r:{draft:Record<string,unknown>;completed_at:Date|null;updated_at:Date})=>({draft:r.draft,completed:r.completed_at!==null,completedAt:r.completed_at,updatedAt:r.updated_at});
export class OnboardingService {
  constructor(
    private readonly repo: OnboardingRepository,
    private readonly copywriter?: ProfileCopywriterGateway,
  ) {}
  async get(id:string){const r=await this.repo.get(id);return r?shape(r):{draft:{},completed:false,completedAt:null};}
  async save(id:string,d:Record<string,unknown>){return shape(await this.repo.save(id,d));}
  async complete(id:string,d:Record<string,unknown>){return shape(await this.repo.complete(id,d));}
  async generateProfileCopy(input: GenerateProfileCopyInput) {
    if (!this.copywriter) throw new HttpError(503, 'AI profile writing is not configured.');
    return this.copywriter.generate(input);
  }
}
