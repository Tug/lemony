import { ScrollView, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function Disclaimer() {
	const { t } = useTranslation();
	return (
		<View>
			<ScrollView tw="mb-2 h-32 bg-gray-100 dark:bg-gray-900">
				<View tw="mx-3 mb-4 mt-1">
					<Text tw="text-[12px] text-black dark:text-white">
						<Trans t={t}>
							Please be aware that the offer is an exempted public
							offering under the Regulation (EU) 2017/1129 on the
							prospectus to be published when securities are
							offered to the public or admitted to trading on a
							regulated market as amended and under the Luxembourg
							law of 16 July 2019 on prospectuses for securities
							as amended and therefore the offering documentation
							has not been approved by the Commission de
							Surveillance du Secteur Financier (CSSF). The offer
							is limited to the Grand Duchy of Luxembourg only.
							Securities are complex instruments and come with a
							risk of losing money and no enrichment is
							guaranteed. You should consider whether you
							understand how securities work, and whether you can
							afford to take the risk to lose money. The delivery
							of the security is not guarantee until the
							pre-requisites are met. You should rely only on the
							information contained in the offering documents that
							you will have access to. We have not authorised
							anyone to provide you with different information. If
							anyone provides you with different or inconsistent
							information, you should not rely on it. We take no
							responsibility for and can provide no assurance as
							to the reliability of, any other information that
							others may give you. You should assume that the
							information appearing in the offering documents is
							accurate only as of the date of the offer.
						</Trans>
					</Text>
				</View>
			</ScrollView>
		</View>
	);
}
