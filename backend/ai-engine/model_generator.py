#!/usr/bin/env python3
"""
Custom AI Image Generation Engine for Story Protocol
Generates creative content using fine-tuned diffusion models
"""

import argparse
import json
import sys
import torch
from diffusers import StableDiffusionPipeline
from safetensors.torch import load_file
import base64
from io import BytesIO

def create_image_from_prompt():
    """Main function to generate images from text prompts using custom models"""
    parser = argparse.ArgumentParser(description='Story Protocol AI Image Generator')
    parser.add_argument('--model_path', type=str, required=True, help='Path to the custom model')
    parser.add_argument('--prompt', type=str, required=True, help='Text prompt for image generation')
    args = parser.parse_args()

    try:
        # Initialize the diffusion pipeline
        diffusion_pipeline = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float32
        )

        # Load custom LoRA weights for personalized generation
        custom_weights_path = f"{args.model_path}/model/pytorch_lora_weights.safetensors"
        model_weights = load_file(custom_weights_path)
        diffusion_pipeline.unet.load_state_dict(model_weights, strict=False)

        # Generate creative content
        generated_image = diffusion_pipeline(
            args.prompt,
            num_inference_steps=30,
            guidance_scale=7.5
        ).images[0]

        # Encode image for transmission
        image_buffer = BytesIO()
        generated_image.save(image_buffer, format="PNG")
        encoded_image = base64.b64encode(image_buffer.getvalue()).decode()

        # Return generated content
        output = {
            "imageData": encoded_image
        }
        print(json.dumps(output))
        sys.exit(0)

    except Exception as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    create_image_from_prompt() 