export interface IRollupBundle {
    file: string;
}
export default function screepsUpload(configFile?: string): {
    name: string;
    onwrite({file}: IRollupBundle): void;
};
