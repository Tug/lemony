export function Table({ data, tdStyles }: { data: any[]; tdStyles?: any[] }) {
	return (
		<table>
			<thead>
				<tr>
					{Object.keys(data?.[0] ?? {})
						.filter((key) => key !== 'id')
						.map((heading) => {
							return <th key={heading}>{heading}</th>;
						})}
				</tr>
			</thead>
			<tbody>
				{data.map((row, index) => {
					return (
						<tr key={index}>
							{Object.keys(data?.[0] ?? {})
								.filter((key) => key !== 'id')
								.map((key, index) => {
									const content = row[key]?.toString?.();
									return (
										<td
											key={row[key]}
											style={tdStyles?.[index]}
										>
											{content &&
											content.match(/^https?:\/\//) ? (
												<a href={content}>open</a>
											) : (
												content
											)}
										</td>
									);
								})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
