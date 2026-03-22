export default async function Read(props: { params: Promise<{ id: any }> }) {
    const params = await props.params;
    return (
        <>
            <h2>Read</h2>
            parameters : {params.id}
        </>
    )
}