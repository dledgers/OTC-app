import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import Joi from "joi";

const schema = Joi.object({
	deposited_currency: Joi.string()
		.valid("BTC", "USDC", "EUR", "TRX", "ETH")
		.required()
		.messages({
			"any.only": `Currency must be one of [BTC, EUR, USDC, ETH, TRX]`,
			"any.required": `"Deposited currency" is a required field`,
		}),
	convert_currency: Joi.string()
		.valid("BTC", "USDC", "EUR", "TRX", "ETH")
		.allow(null)
		.required()
		.messages({
			"any.only": `Currency must be one of [BTC, EUR, USDC, ETH, TRX]`,
			"any.required": `"Convert currency" is a required field`,
		}),
	network: Joi.string()
		.valid("ERC20", "TRC20")
		.allow(null)
		.when("convert_currency", {
			is: "USDC",
			then: Joi.when("auto_withdraw", {
				is: true,
				then: Joi.required().messages({
					"any.required": `"Network" is required when convert currency is USDC and auto withdraw is enabled`,
				}),
			}),
		})
		.messages({
			"any.only": `Network must be one of [ERC20, TRC20]`,
		}),
	withdraw_to: Joi.alternatives().conditional("auto_withdraw", {
		is: true,
		then: Joi.string().required().messages({
			"any.required": `"Withdraw to" is required when auto withdraw is enabled`,
			"string.empty": `"Withdraw to" cannot be an empty string when auto withdraw is enabled`,
		}),
		otherwise: Joi.string().allow(null),
	}),
	active: Joi.boolean().required().messages({
		"any.required": `"Active" is a required field`,
	}),
	auto_withdraw: Joi.boolean().required().messages({
		"any.required": `"Auto withdraw" is a required field`,
	}),
});
export default eventHandler(async (event) => {
	const client = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);

	const { error, value } = schema.validate(body, { abortEarly: false });
	if (error) {
		console.error("Validation error:", error.details[0].message);
		throw createError({
			statusCode: 400,
			statusMessage: error.details[0].message,
		});
	}

	let { data, error: dbError } = await client
		.from("autopilot")
		.update(body)
		.eq("deposited_currency", body.deposited_currency);
	if (dbError) {
		throw createError({
			statusCode: 400,
			statusMessage: error.message,
		});
	}
	return data;
});
