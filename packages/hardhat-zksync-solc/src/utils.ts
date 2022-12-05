import { NomicLabsHardhatPluginError } from 'hardhat/plugins';
import { getCompilersDir } from 'hardhat/internal/util/global-dir';
import path from 'path';
import { MultiSolcUserConfig, SolcConfig, SolcUserConfig, SolidityUserConfig } from 'hardhat/types';
import { defaultSolcOutputSelectionConfig, SUPPORTED_ZKSOLC_CONTRACT_OUTPUT_SELECTIONS } from './constants';

export function isMultiSolcUserConfig(solcConfig: SolidityUserConfig | undefined): solcConfig is MultiSolcUserConfig {
    return typeof solcConfig === 'object' && 'compilers' in solcConfig;
}

export function isSolcUserConfig(solcConfig: SolidityUserConfig | undefined): solcConfig is SolcUserConfig {
    return typeof solcConfig === 'object' && 'version' in solcConfig;
}

export function filterSupportedOutputSelections(outputSelections: string[]): string[] {
    return outputSelections.filter((contractOutputSelection: string) =>
        SUPPORTED_ZKSOLC_CONTRACT_OUTPUT_SELECTIONS.includes(contractOutputSelection)
    );
}

export function hasUnsupportedOutputSelections(outputSelections: string[]): boolean {
    return outputSelections.some(
        (contractOutputSelection: string) =>
            !SUPPORTED_ZKSOLC_CONTRACT_OUTPUT_SELECTIONS.includes(contractOutputSelection)
    );
}

export function resolveCompilerOutputSelection(userOutputSelection: any, compiler: SolcConfig) {
    if (!userOutputSelection) {
        compiler.settings.outputSelection = defaultSolcOutputSelectionConfig;
    } else if (hasUnsupportedOutputSelections(userOutputSelection['*']['*'])) {
        console.warn(
            `Compiler settings has unsupported output selections.\nSupported values are: ${SUPPORTED_ZKSOLC_CONTRACT_OUTPUT_SELECTIONS.join(
                ', '
            )}.`
        );
    }
}

export function zeroxlify(hex: string): string {
    hex = hex.toLowerCase();
    return hex.slice(0, 2) === '0x' ? hex : `0x${hex}`;
}

// Returns a built plugin exception object.
export function pluginError(message: string, parent?: any): NomicLabsHardhatPluginError {
    return new NomicLabsHardhatPluginError('@matterlabs/hardhat-zksync-solc', message, parent);
}

export async function getZksolcPath(version: string): Promise<string> {
    return path.join(await getCompilersDir(), 'zksolc', `zksolc-v${version}`);
}

export function getZksolcUrl(version: string): string {
    // @ts-ignore
    const platform = { darwin: 'macosx', linux: 'linux', win32: 'windows' }[process.platform];
    // @ts-ignore
    const toolchain = { linux: '-musl', win32: '-gnu', darwin: '' }[process.platform];
    const arch = process.arch == 'x64' ? 'amd64' : process.arch;
    const ext = process.platform == 'win32' ? '.exe' : '';
    return `https://github.com/matter-labs/zksolc-bin/raw/main/${platform}-${arch}/zksolc-${platform}-${arch}${toolchain}-v${version}${ext}`;
}
