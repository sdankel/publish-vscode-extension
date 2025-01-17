'use strict';

import { expect, use } from 'chai';
import { stub, SinonStub } from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as vsce from '@vscode/vsce';
import * as ovsx from 'ovsx';

import { publish } from '../src/publish';

use(sinonChai);

describe('publish', () => {
    let publishVSIXStub: SinonStub;
    let publishOpenVSXStub: SinonStub;
    before(() => {
        publishVSIXStub = stub(vsce, 'publishVSIX').resolves();
        publishOpenVSXStub = stub(ovsx, 'publish').resolves();
    });

    beforeEach(() => {
        publishOpenVSXStub.resetHistory();
        publishVSIXStub.resetHistory();
    });

    it('should attempt to publish to Visual Studio Marketplace', async () => {
        await publish({
            registryUrl: 'https://marketplace.visualstudio.com',
            baseContentUrl: 'myBaseContentUrl',
            baseImagesUrl: 'myBaseImageUrl',
            extensionFile: 'myExtensionFile',
            packagePath: 'myPackagePath',
            pat: 'myPersonalAccessToken',
            yarn: false,
            noVerify: true,
            dependencies: true,
        });

        expect(publishVSIXStub).to.have.been.calledOnceWithExactly('myExtensionFile', {
            baseContentUrl: 'myBaseContentUrl',
            baseImagesUrl: 'myBaseImageUrl',
            pat: 'myPersonalAccessToken',
            useYarn: false,
            noVerify: true,
            dependencies: true,
        });
    });

    it('should attempt to publish to Open VSX registry', async () => {
        await publish({
            registryUrl: 'https://open-vsx.org',
            baseContentUrl: 'myBaseContentUrl',
            baseImagesUrl: 'myBaseImageUrl',
            extensionFile: 'myExtensionFile',
            packagePath: 'myPackagePath',
            pat: 'myPersonalAccessToken',
            yarn: false
        });

        expect(publishOpenVSXStub).to.have.been.calledOnceWithExactly({
            registryUrl: 'https://open-vsx.org',
            baseContentUrl: 'myBaseContentUrl',
            baseImagesUrl: 'myBaseImageUrl',
            extensionFile: 'myExtensionFile',
            packagePath: ['myPackagePath'],
            pat: 'myPersonalAccessToken',
            yarn: false
        });
    });

    it('failed attempt to publish preRelease to Open VSX registry', async () =>
        publish({
            registryUrl: 'https://open-vsx.org',
            baseContentUrl: 'myBaseContentUrl',
            baseImagesUrl: 'myBaseImageUrl',
            extensionFile: 'myExtensionFile',
            packagePath: 'myPackagePath',
            pat: 'myPersonalAccessToken',
            yarn: true
        }).catch(error =>
            expect(error)
                .to.be.an('error')
                .with.property('message', 'Open VSX does not support option preRelease')
        ));
});
