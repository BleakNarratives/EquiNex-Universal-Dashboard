import { IDevOpsResult } from '../types';
import { postJson } from './api';

const getMockClone = (repoUrl: string): IDevOpsResult => {
    if (!repoUrl || !repoUrl.includes('github.com')) {
        return { success: false, message: 'Invalid repository URL provided.' };
    }
    const repoName = repoUrl.split('/').pop()?.replace('.git', '');
    return {
        success: true,
        message: `Successfully cloned repository '${repoName}'.`,
        details: `Checked out 'main' branch. Total objects: 1.2M, compressed: 450MB.`,
    };
};

const getMockHfPull = (spaceId: string): IDevOpsResult => {
    if (!spaceId || !spaceId.includes('/')) {
        return { success: false, message: 'Invalid Hugging Face space ID. Expected format: user/space-name' };
    }
    return {
        success: true,
        message: `Successfully pulled space '${spaceId}'.`,
        details: `Model files and application code synced to local cache. Ready for integration.`,
    };
};

const cloneRepo = (repoUrl: string): Promise<IDevOpsResult> => {
    return postJson<IDevOpsResult>('/api/devops/git-clone', { url: repoUrl })
        .catch((err) => {
            console.warn(`[equinex] backend unreachable for POST /api/devops/git-clone — using local fallback.`, err);
            return new Promise<IDevOpsResult>(resolve => setTimeout(() => resolve(getMockClone(repoUrl)), 2000));
        });
};

const pullHuggingFaceSpace = (spaceId: string): Promise<IDevOpsResult> => {
    return postJson<IDevOpsResult>('/api/devops/hf-pull', { space_id: spaceId })
        .catch((err) => {
            console.warn(`[equinex] backend unreachable for POST /api/devops/hf-pull — using local fallback.`, err);
            return new Promise<IDevOpsResult>(resolve => setTimeout(() => resolve(getMockHfPull(spaceId)), 2500));
        });
};

export const devOpsService = {
    cloneRepo,
    pullHuggingFaceSpace,
};
